import { cn } from "@/lib/utils";
import type { PolymorphicProps } from "@/lib/type-helpers/polymorphism-helper";

type HeadingElements = keyof typeof semanticHeadings;

type HeadingProps<TElement extends HeadingElements> = {
  as: TElement;
  children: React.ReactNode;
  className?: string;
};

const semanticHeadings = {
  h1: "font-bold text-base lg:text-2xl",
  h2: "font-bold text-base lg:text-2xl",
  h3: "font-bold text-base lg:text-xl",
  h4: "font-medium text-xs lg:text-xl",
};

function Heading<TElement extends HeadingElements = "h1">(
  props: PolymorphicProps<TElement, HeadingProps<TElement>>
) {
  const {
    as: HeadingElement = "h1",
    children,
    className,
    ...restOfProps
  } = props;

  const HEADING_CLASSES = cn(
    semanticHeadings[HeadingElement as HeadingElements],
    className
  );

  return (
    <HeadingElement className={HEADING_CLASSES} {...restOfProps}>
      {children}
    </HeadingElement>
  );
}
export default Heading;
