import type { Subject } from "./Subject";
import { LoggingService } from "../core/services/LoggingService";

export interface IObserver {
  update(): void;
}

export class Observer implements IObserver {
  private subject: Subject;

  constructor(subject: Subject) {
    this.subject = subject;
    this.subject.registerObserver(this);
  }

  update(): void {
    LoggingService.info("Observer updated");
  }
}
