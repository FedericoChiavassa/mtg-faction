import { Link } from '@tanstack/react-router';

import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import type { useFactionForm } from '@/features/factions/hooks/form/use-faction-form';
import { FactionForm } from '@/features/factions/ui/form/faction-form';

export function FormDrawer({
  open,
  setOpen,
  form,
  isFormDirty,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  form: ReturnType<typeof useFactionForm>['form'];
  isFormDirty: boolean;
}) {
  return (
    <Drawer fixed open={open} onOpenChange={() => setOpen(false)}>
      <DrawerContent className="min-h-[80dvh]">
        <DrawerHeader className="sr-only">
          <DrawerTitle>Form options</DrawerTitle>
        </DrawerHeader>

        <div className="no-scrollbar overflow-y-auto bg-background px-4 pt-6">
          <FactionForm
            isMobile
            form={form}
            className="pb-11.5"
            isDirty={isFormDirty}
          />
        </div>

        <DrawerFooter className="flex flex-row gap-2 border-t bg-card">
          <Button
            size="xs"
            type="submit"
            className="flex-1"
            onClick={e => {
              e.preventDefault();
              e.stopPropagation();
              void form.handleSubmit();
            }}
          >
            Apply
          </Button>
          {isFormDirty && (
            <Button
              size="xs"
              type="reset"
              variant="outline"
              nativeButton={false}
              onClick={() => setOpen(false)}
              className="flex-1 bg-background no-underline!"
              render={
                <Link
                  to="/factions"
                  resetScroll={false}
                  search={prev => ({
                    perPage: prev.perPage,
                    sortBy: prev.sortBy,
                  })}
                />
              }
            >
              Reset
            </Button>
          )}

          <DrawerClose asChild className="flex flex-1">
            <Button size="xs" variant="outline" className="flex-1">
              Cancel
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
