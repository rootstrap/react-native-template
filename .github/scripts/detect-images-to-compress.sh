#!/usr/bin/env bash
# Used by .github/workflows/compress-images.yml on push.
#
# Finds the images added or updated by the pushed commits that still need compressing. An image is skipped when
# the last commit that changed it is one of the workflow's own compression commits: its commit message, its PR
# title, or either of them followed by " (#N)" (squash merge titles). Merge commits are not considered, so a
# compression PR merged with a merge commit is recognised through its own commit.
#
# Inputs (environment):
#   BEFORE, AFTER            commits before and after the push (github.event.before / github.sha)
#   IGNORE_PATHS             comma-separated "<dir>/**" entries that are never compressed
#   COMPRESS_COMMIT_MESSAGE  commit message of the compression PR
#   COMPRESS_PR_TITLE        title of the compression PR
#   GITHUB_OUTPUT            file the step outputs are appended to
#
# Outputs:
#   skip=true                       nothing to compress
#   skip=false and ignore-paths=... ignorePaths for calibreapp/image-actions, so only the selected images are
#                                   compressed (that action compresses every image of the repo outside pull requests)
set -euo pipefail

ere_escape() {
  printf '%s' "$1" | sed -e 's/[][\\.*^$()+?{}|/]/\\&/g'
}

image_re='\.(jpe?g|png|webp|avif)$'
ignored_re="^($(printf '%s' "$IGNORE_PATHS" | sed -e 's#/\*\*##g' -e 's/[.]/\\./g' -e 's/,/|/g'))/"
compress_commit_re="^($(ere_escape "$COMPRESS_PR_TITLE")|$(ere_escape "$COMPRESS_COMMIT_MESSAGE"))( \(#[0-9]+\))?$"

work_dir=$(mktemp -d)
trap 'rm -rf "$work_dir"' EXIT
candidates_file="$work_dir/candidates"
targets_file="$work_dir/targets"
: > "$targets_file"

# File names are read NUL-separated and converted to lines, so git does not quote unusual names.
# First push of the branch or force push (BEFORE missing or not an ancestor of AFTER): every image of the pushed
# tree is a candidate and the whole history of AFTER is inspected.
if [[ "$BEFORE" =~ ^0+$ ]] || ! git merge-base --is-ancestor "$BEFORE" "$AFTER" 2>/dev/null; then
  range="$AFTER"
  git ls-tree -r -z --name-only "$AFTER" | tr '\0' '\n' > "$work_dir/changed"
else
  range="${BEFORE}..${AFTER}"
  git diff -z --name-only --no-renames --diff-filter=AM "$BEFORE" "$AFTER" | tr '\0' '\n' > "$work_dir/changed"
fi
{ grep -iE "$image_re" "$work_dir/changed" | grep -vE "$ignored_re" || true; } > "$candidates_file"

if [ ! -s "$candidates_file" ]; then
  echo "No new or updated images to compress."
  echo "skip=true" >> "$GITHUB_OUTPUT"
  exit 0
fi

# One pass over the history: for every candidate, the subject of the newest non-merge commit that changed it.
# Lines starting with \001 are commit subjects, the following lines are the files that commit changed.
# Prints "<subject>\037<file>" (unlike tabs, \037 does not occur in real subjects or paths); a candidate that no
# non-merge commit in the range changed (e.g. only a merge commit added it) gets an empty subject.
git -c core.quotePath=false log --no-merges --topo-order --no-renames --name-only -z --format='%x01%s' "$range" \
  | tr '\0' '\n' \
  | awk '
      NR == FNR { if ($0 != "") { wanted[$0] = 1; order[++count] = $0 }; next }
      substr($0, 1, 1) == "\001" { subject = substr($0, 2); next }
      $0 == "" { next }
      ($0 in wanted) && !($0 in found) { found[$0] = subject }
      END { for (i = 1; i <= count; i++) print found[order[i]] "\037" order[i] }
    ' "$candidates_file" - > "$work_dir/subjects"

while IFS=$'\037' read -r subject file; do
  [ -n "$file" ] || continue
  if [[ "$subject" =~ $compress_commit_re ]]; then
    echo "Skipping $file: already compressed in \"$subject\""
    continue
  fi
  echo "Will compress $file (last changed in \"$subject\")"
  printf '%s\n' "$file" >> "$targets_file"
done < "$work_dir/subjects"

if [ ! -s "$targets_file" ]; then
  echo "No new or updated images to compress."
  echo "skip=true" >> "$GITHUB_OUTPUT"
  exit 0
fi

# Ignore every other image. A directory without any selected image is ignored as a whole ("<dir>/**"), so the
# list grows with the number of directories next to the selected images rather than with the number of images.
# Glob characters and commas (the action splits ignorePaths on commas) are replaced by the single-character
# wildcard "?". Known edge case, accepted on purpose: such a wildcard can also match a selected image whose name
# differs only in those characters (e.g. ignored "a[1].png" -> "a?1?.png" also matches "a-1-.png"), which then
# stays uncompressed until the next run.
ignore_paths="$IGNORE_PATHS"
while IFS= read -r entry; do
  ignore_paths+=",$entry"
done < <(
  git ls-files -z | tr '\0' '\n' | grep -iE "$image_re" | grep -vE "$ignored_re" | grep -vxF -f "$targets_file" \
    | awk '
        function glob_escape(s,   out, i, c) {
          out = ""
          for (i = 1; i <= length(s); i++) {
            c = substr(s, i, 1)
            if (index("[]\\*?{}()!+@,", c)) c = "?"
            out = out c
          }
          return out
        }
        NR == FNR {
          n = split($0, parts, "/")
          dir = ""
          for (i = 1; i < n; i++) { dir = dir (i > 1 ? "/" : "") parts[i]; has_target[dir] = 1 }
          next
        }
        {
          n = split($0, parts, "/")
          dir = ""
          entry = glob_escape($0)
          for (i = 1; i < n; i++) {
            dir = dir (i > 1 ? "/" : "") parts[i]
            if (!(dir in has_target)) { entry = glob_escape(dir) "/**"; break }
          }
          if (!(entry in printed)) { printed[entry] = 1; print entry }
        }
      ' "$targets_file" -
)

echo "skip=false" >> "$GITHUB_OUTPUT"
echo "ignore-paths=$ignore_paths" >> "$GITHUB_OUTPUT"
