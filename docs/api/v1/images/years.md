# GET /api/v1/images/years

Returns a list of years that have at least one image in either the gallery or groups.

## URL
`/api/v1/images/years`

## Method
`GET`

## Success Response Example
- **Code**: 200 OK
- **Content**:
```json
{
  "years": [
    {
      "year": "2026",
      "galleryImagesCount": 42,
      "groupsImagesCount": 5
    },
    {
      "year": "2025",
      "galleryImagesCount": 128,
      "groupsImagesCount": 12
    }
  ]
}
```

## Description
This endpoint performs a directory traversal of `public/imgs/years` and counts images in `gallery` and `groups` subfolders. It is used to generate year navigation and filter options.
