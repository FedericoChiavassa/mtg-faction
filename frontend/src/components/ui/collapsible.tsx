import { Collapsible as CollapsiblePrimitive } from '@base-ui/react/collapsible';

import { cn } from '@/lib/utils';

function Collapsible({ ...props }: CollapsiblePrimitive.Root.Props) {
  return <CollapsiblePrimitive.Root data-slot="collapsible" {...props} />;
}

function CollapsibleTrigger({ ...props }: CollapsiblePrimitive.Trigger.Props) {
  return (
    <CollapsiblePrimitive.Trigger data-slot="collapsible-trigger" {...props} />
  );
}

function CollapsibleContent({
  animate = false,
  className,
  ...props
}: CollapsiblePrimitive.Panel.Props & { animate?: boolean }) {
  return (
    <CollapsiblePrimitive.Panel
      data-slot="collapsible-content"
      className={cn(
        animate &&
          'overflow-hidden [--radix-collapsible-content-height:var(--collapsible-panel-height)] data-ending-style:animate-collapsible-up data-starting-style:animate-collapsible-down data-open:animate-collapsible-down data-closed:animate-collapsible-up',
        className,
      )}
      {...props}
    />
  );
}

export { Collapsible, CollapsibleContent, CollapsibleTrigger };
