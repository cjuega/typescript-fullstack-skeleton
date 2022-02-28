Feature: Get service's version
    As an user
    I want to query the service's version

    Scenario: Requesting service version
        When I send a GET request to "/api/version"
        Then the response status code should be 200
        And the response body should indicate the version of package.json
        And the response is valid according to OpenAPI "dist/docs/api/openapi.yml" with path "/api/version"