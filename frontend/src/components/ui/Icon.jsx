export default function Icon({ name, size, width, height, style, ...rest }) {
  const w = size ?? width;
  const h = size ?? height;
  return (
    <svg width={w} height={h} style={style} {...rest}>
      <use href={`#${name}`} />
    </svg>
  );
}
