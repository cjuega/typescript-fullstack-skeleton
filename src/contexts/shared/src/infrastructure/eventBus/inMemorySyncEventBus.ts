import DomainEvent from '@src/domain/eventBus/domainEvent';
import { DomainEventSubscriber } from '@src/domain/eventBus/domainEventSubscriber';
import { EventBus } from '@src/domain/eventBus/eventBus';

export default class InMemorySyncEventBus implements EventBus {
    // eslint-disable-next-line @typescript-eslint/ban-types
    private readonly subscriptions: Map<string, Function[]> = new Map();

    constructor(subscribers: DomainEventSubscriber<DomainEvent>[]) {
        this.registerSubscribers(subscribers);
    }

    async publish(events: DomainEvent[]): Promise<void> {
        const executions: Array<Promise<void>> = [];

        events.forEach((event) => {
            const subscribers = this.subscriptions.get(event.eventName);

            if (subscribers) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                subscribers.map((subscriber) => executions.push(subscriber(event)));
            }
        });

        await Promise.all(executions);
    }

    private registerSubscribers(subscribers: DomainEventSubscriber<DomainEvent>[]): void {
        subscribers.forEach((subscriber) => {
            subscriber.subscribedTo().forEach((event) => {
                this.subscribe(event.eventName, subscriber);
            });
        });
    }

    private subscribe(topic: string, subscriber: DomainEventSubscriber<DomainEvent>): void {
        const currentSubscriptions = this.subscriptions.get(topic),
            subscription = subscriber.on.bind(subscriber);

        if (currentSubscriptions) {
            currentSubscriptions.push(subscription);
        } else {
            this.subscriptions.set(topic, [subscription]);
        }
    }
}
