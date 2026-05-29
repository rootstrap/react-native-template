import type { ImageProps } from 'expo-image';
import { Image as NImage } from 'expo-image';
import { cssInterop } from 'nativewind';

export type ImgProps = ImageProps & {
  className?: string;
};

cssInterop(NImage, { className: 'style' });

export function Image({
  style,
  className,
  placeholder = 'L6PZfSi_.AyE_3t7t7R**0o#DgR4',
  ...props
}: ImgProps) {
  return (
    <NImage
      className={className}
      placeholder={placeholder}
      style={style}
      {...props}
    />
  );
}

export function preloadImages(sources: Array<string>) {
  void NImage.prefetch(sources);
}
