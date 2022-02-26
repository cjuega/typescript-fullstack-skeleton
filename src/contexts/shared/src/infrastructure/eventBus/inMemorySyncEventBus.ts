/* eslint-disable @typescript-eslint/ban-types */
import { DomainEvent } from '@src/domain/eventBus/domainEvent';
import { DomainEventSubscriber } from '@src/domain/eventBus/domainEventSubscriber';
import { EventBus } from '@src/domain/eventBus/eventBus';

type Subscription = {
    boundedCallback: Function;
    originalCallback: Function;
};

export default class InMemorySyncEventBus implements EventBus {
    private subscriptions: Map<string, Array<Subscription>>;

    constructor() {
        this.subscriptions = new Map();
    }

    async publish(events: Array<DomainEvent>): Promise<void> {
        const executions: any = [];

        events.forEach((event) => {
            const subscribers = this.subscriptions.get(event.eventName);

            if (subscribers) {
                subscribers.map((subscriber) => executions.push(subscriber.boundedCallback(event)));
            }
        });

        await Promise.all(executions);
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    addSubscribers(subscribers: Array<DomainEventSubscriber<DomainEvent>>) {
        subscribers.map((subscriber) => subscriber
            .subscribedTo()
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            .map((event) => this.subscribe(event.EVENT_NAME!, subscriber)));
    }

    private subscribe(topic: string, subscriber: DomainEventSubscriber<DomainEvent>): void {
        const currentSubscriptions = this.subscriptions.get(topic),
            subscription = {
                boundedCallback: subscriber.on.bind(subscriber),
                originalCallback: subscriber.on
            };

        if (currentSubscriptions) {
            currentSubscriptions.push(subscription);
        } else {
            this.subscriptions.set(topic, [subscription]);
        }
    }
}
