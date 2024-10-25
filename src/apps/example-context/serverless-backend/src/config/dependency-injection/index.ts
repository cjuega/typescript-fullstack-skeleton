import appRegister from '@src/config/dependency-injection/app/application.di';
import exampleAggregateRegister from '@src/config/dependency-injection/example-aggregate/application.di';
import setupBuses from '@src/config/dependency-injection/setupBuses';
import sharedRegister from '@src/config/dependency-injection/shared/application.di';
import { ContainerBuilder } from 'node-dependency-injection';

const container = new ContainerBuilder();

sharedRegister(container);
appRegister(container);
exampleAggregateRegister(container);

setupBuses(container);

export default container;
