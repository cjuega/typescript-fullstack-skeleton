Feature: Create a new ExampleAggregate
    As an user
    I want to create a new ExampleAggregate

    Scenario: Happy path
        When I send a PUT request to "/example-aggregates/94c91d09-bd7c-4609-a01f-1c19ab27ed2f" with body:
            """
            {}
            """
        And the request is valid according to OpenAPI "dist/docs/api/openapi.yml" with path "/example-aggregates/{id}"
        Then the response status code should be 201
        And the response body should be empty