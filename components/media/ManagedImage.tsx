import Image from 'next/image';

interface ManagedImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  sizes?: string;
  priority?: boolean;
}

export default function ManagedImage({
  src,
  alt,
  fill,
  width = 800,
  height = 600,
  className,
  sizes,
  priority,
}: ManagedImageProps) {
  const isInlineImage = src.startsWith('data:');

  if (isInlineImage) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} className={fill ? `absolute inset-0 h-full w-full ${className || ''}` : className} />;
  }

  if (fill) {
    return <Image src={src} alt={alt} fill className={className} sizes={sizes} priority={priority} />;
  }

  return <Image src={src} alt={alt} width={width} height={height} className={className} priority={priority} />;
}
