export interface BottomSheetConfig<T> {
  title: string;
  fields: { key: string; label: string }[];
  data: T;
}