# GET /api/v1/images/photographers

Returns a sorted list of all photographers/authors recognized by the system.

## URL
`/api/v1/images/photographers`

## Method
`GET`

## Authentication
None required.

## Success Response Example
- **Code**: 200 OK
- **Content**:
```json
[
  {
    "name": "Jakub Ferenčík",
    "shortcut": "jfer"
  },
  {
    "name": "Jan Martínek",
    "nickname": "Mumínek",
    "shortcut": "mum"
  },
  ...
]
```

## Description
This endpoint provides a registry of all contributors whose work is featured in the gallery. It is used primarily for client-side filtering by author.
