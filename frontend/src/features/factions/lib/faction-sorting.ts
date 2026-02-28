export function isSortingDesc(sortBy: string) {
  switch (sortBy) {
    case 'identity_count':
    case 'name':
      return false;
    default:
      return true;
  }
}
