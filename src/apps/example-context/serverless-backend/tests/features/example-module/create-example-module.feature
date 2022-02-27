Feature: Create a new ExampleModule
    As an user
    I want to create a new ExampleModule

    Scenario: Happy path
        When I send a PUT request to "/example-modules/94c91d09-bd7c-4609-a01f-1c19ab27ed2f" with body:
            """
            {}
            """
        Then the response status code should be 201
        And the response body should be empty