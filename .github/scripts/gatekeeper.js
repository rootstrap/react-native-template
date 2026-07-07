// Layer 4 - Classification and Routing Gatekeeper
//
// Routing table (required approvals):
//
//   Risk \ AI findings | clean | minor | serious
//   -------------------|-------|-------|--------
//   low                |   0   |   0   |    1
//   medium             |   0   |   1   |    2
//   high               |   1   |   2   |    2

const ROUTING_TABLE = {
  low: { clean: 0, minor: 0, serious: 1 },
  medium: { clean: 0, minor: 1, serious: 2 },
  high: { clean: 1, minor: 2, serious: 2 },
};

// Resolve the PR number and head SHA depending on the triggering event.
async function resolvePr({ github, context, core }) {
  if (context.eventName === 'pull_request' || context.eventName === 'pull_request_review') {
    return {
      prNumber: context.payload.pull_request.number,
      headSha: context.payload.pull_request.head.sha,
    };
  }

  if (context.eventName === 'check_suite') {
    // check_suite doesn't directly reference a PR; find the associated open PR.
    const headBranch = context.payload.check_suite.head_branch;

    const { data: prs } = await github.rest.pulls.list({
      owner: context.repo.owner,
      repo: context.repo.repo,
      state: 'open',
      head: `${context.repo.owner}:${headBranch}`,
    });

    if (prs.length === 0) {
      core.info('check_suite: no open PR found for this branch, skipping.');
      return null;
    }

    return { prNumber: prs[0].number, headSha: context.payload.check_suite.head_sha };
  }

  core.info(`Unhandled event: ${context.eventName}`);
  return null;
}

// Determine required approvals from the risk:* and ai:* labels.
function getRoutingDecision(labelNames) {
  const riskLabel = labelNames.find(l => l.startsWith('risk:'));
  const riskKey = riskLabel ? riskLabel.replace('risk:', '') : null;

  const aiLabel = labelNames.find(l => l.startsWith('ai:'));
  const aiKey = aiLabel ? aiLabel.replace('ai:', '') : null;

  if (!riskKey || !aiKey) {
    // Labels not yet applied — stay pending so the PR can't slip through.
    return { riskKey, aiKey, requiredApprovals: null, statusDescription: 'Waiting for risk and AI labels to be applied.' };
  }

  if (!ROUTING_TABLE[riskKey] || ROUTING_TABLE[riskKey][aiKey] === undefined) {
    return { riskKey, aiKey, requiredApprovals: null, statusDescription: `Unknown label combination: risk:${riskKey}, ai:${aiKey}.` };
  }

  return { riskKey, aiKey, requiredApprovals: ROUTING_TABLE[riskKey][aiKey], statusDescription: null };
}

// Count current APPROVED reviews, keeping only the most-recent review per reviewer.
async function countApprovals({ github, context, prNumber }) {
  const { data: reviews } = await github.rest.pulls.listReviews({
    owner: context.repo.owner,
    repo: context.repo.repo,
    pull_number: prNumber,
  });

  const latestByReviewer = {};
  for (const review of reviews) {
    // Keep the latest review per user (reviews are returned in chronological order).
    latestByReviewer[review.user.login] = review.state;
  }

  return Object.values(latestByReviewer).filter(s => s === 'APPROVED').length;
}

// Decide the commit status state/description from the routing decision and approval count.
function computeStatus({ requiredApprovals, statusDescription, riskKey, aiKey, approvalCount }) {
  if (requiredApprovals === null) {
    return { state: 'pending', description: statusDescription };
  }

  if (requiredApprovals === 0) {
    return { state: 'success', description: `risk:${riskKey} + ai:${aiKey} → auto-merge allowed (0 approvals required).` };
  }

  if (approvalCount >= requiredApprovals) {
    return { state: 'success', description: `risk:${riskKey} + ai:${aiKey} → approved (${approvalCount}/${requiredApprovals}).` };
  }

  return { state: 'pending', description: `risk:${riskKey} + ai:${aiKey} → waiting for approvals (${approvalCount}/${requiredApprovals}).` };
}

module.exports = async ({ github, context, core }) => {
  const pr = await resolvePr({ github, context, core });
  if (!pr) {
    return;
  }
  const { prNumber, headSha } = pr;

  const { data: prData } = await github.rest.pulls.get({
    owner: context.repo.owner,
    repo: context.repo.repo,
    pull_number: prNumber,
  });

  const labelNames = prData.labels.map(l => l.name);
  core.info(`PR #${prNumber} labels: ${labelNames.join(', ') || '(none)'}`);

  const { riskKey, aiKey, requiredApprovals, statusDescription } = getRoutingDecision(labelNames);

  const approvalCount = await countApprovals({ github, context, prNumber });
  core.info(`Approvals: ${approvalCount}`);

  const { state, description } = computeStatus({ requiredApprovals, statusDescription, riskKey, aiKey, approvalCount });
  core.info(`Setting status: ${state} — ${description}`);

  // The context name MUST match the required status check name in branch protection.
  await github.rest.repos.createCommitStatus({
    owner: context.repo.owner,
    repo: context.repo.repo,
    sha: headSha,
    state,
    description,
    context: 'layer4-gatekeeper',
  });
};
