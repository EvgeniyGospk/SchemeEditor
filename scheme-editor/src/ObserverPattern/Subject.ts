import type { IObserver } from "./Observer";

interface ISubject {
  registerObserver(observer: IObserver): void;
  unregisterObserver(observer: IObserver): void;
  notifyObservers(): void;
}

export class Subject implements ISubject {
  private observers: IObserver[] = [];

  registerObserver(observer: IObserver): void {
    this.observers.push(observer);
  }

  unregisterObserver(observer: IObserver): void {
    this.observers = this.observers.filter((obs) => obs !== observer);
  }

  notifyObservers(): void {
    for (const observer of this.observers) {
      observer.update();
    }
  }
}
