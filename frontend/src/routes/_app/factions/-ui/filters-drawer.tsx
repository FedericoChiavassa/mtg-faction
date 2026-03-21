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
import type { useFactionForm } from '@/features/factions/hooks/use-faction-form';
import type { useFactionStats } from '@/features/factions/queries';
import { FilterForm } from '@/features/factions/ui/filter-form';

export function FiltersDrawer({
  openFilters,
  setOpenFilters,
  form,
  stats,
  closeFilters,
  isFiltersDirty,
}: {
  openFilters: boolean;
  setOpenFilters: (open: boolean) => void;
  form: ReturnType<typeof useFactionForm>['form'];
  stats: ReturnType<typeof useFactionStats>['data'];
  closeFilters: () => void;
  isFiltersDirty: boolean;
}) {
  return (
    <Drawer fixed open={openFilters} onOpenChange={() => setOpenFilters(false)}>
      <DrawerContent className="min-h-[80dvh]">
        <DrawerHeader className="sr-only">
          <DrawerTitle>Filters options</DrawerTitle>
        </DrawerHeader>

        <div className="no-scrollbar overflow-y-auto bg-background px-4 pt-6">
          <FilterForm
            isMobile
            form={form}
            stats={stats}
            className="pb-11.5"
            onClose={closeFilters}
            isDirty={isFiltersDirty}
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
          {isFiltersDirty && (
            <Button
              size="xs"
              type="reset"
              variant="outline"
              nativeButton={false}
              onClick={() => setOpenFilters(false)}
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
