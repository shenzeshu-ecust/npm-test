type Watcher<T> = {
  // 排除键是symbol的情况
  on<K extends string & keyof T>(
    eventName: `${K}Change`,
    callback: (oldValue: T[K], newValue: T[K]) => void
  ): void;
};

declare function watch<T>(obj: T): Watcher<T>;

const personWatcher = watch({
  name: "szs",
  age: 28,
});
personWatcher.on("nameChange", (newVal, oldVal) => {});
personWatcher.on("ageChange", (newVal, oldVal) => {});
