import { ContainerBuilder, Reference } from 'node-dependency-injection';
import DdbOneTableEnvironmentArranger from '@context/shared/infrastructure/persistence/ddbOneTable/ddbOneTableEnvironmentArranger';
import EnvironmentMultiArranger from '@context/shared/infrastructure/arranger/environmentMultiArranger';

const register = (container: ContainerBuilder): void => {
    container
        .register('Tests.DdbOneTableEnvironmentArranger', DdbOneTableEnvironmentArranger)
        .addArgument(new Reference('Shared.DynamodbTable'));

    container
        .register('Tests.EnvironmentArranger', EnvironmentMultiArranger)
        .addArgument(new Reference('Tests.DdbOneTableEnvironmentArranger'));
};

export default register;
