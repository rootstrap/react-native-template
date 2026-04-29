/* eslint-disable react-refresh/only-export-components */
import type { ImageProps } from 'expo-image';
import { Image as NImage } from 'expo-image';
<<<<<<< HEAD
import { cssInterop } from 'nativewind';
=======
import * as React from 'react';
import { withUniwind } from 'uniwind';

>>>>>>> f6309e9
export type ImgProps = ImageProps & {
  className?: string;
};

const StyledImage = withUniwind(NImage);

export function Image({
  style,
  className,
  placeholder = 'L6PZfSi_.AyE_3t7t7R**0o#DgR4',
  ...props
<<<<<<< HEAD
}: ImgProps) => (
  <NImage
    className={className}
    placeholder={placeholder}
    style={style}
    {...props}
  />
);

export const preloadImages = (sources: Array<string>) => {
=======
}: ImgProps) {
  return (
    <StyledImage
      className={className}
      placeholder={placeholder}
      style={style}
      {...props}
    />
  );
}

export function preloadImages(sources: string[]) {
>>>>>>> f6309e9
  NImage.prefetch(sources);
}
