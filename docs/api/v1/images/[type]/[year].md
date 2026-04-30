# GET /api/v1/images/{type}/{year}

Returns minified image metadata for a specific year and category (gallery or groups).

## URL
`/api/v1/images/{type}/{year}`

## Method
`GET`

## URL Parameters
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `type` | `string` | Yes | Either `gallery` or `groups` |
| `year` | `string` | Yes | 4-digit year (e.g., `2024`) |

## Success Response Example
- **Code**: 200 OK
- **Content**:
```json
{
  "images": {
    "2024": [
      {
        "p": "/imgs/years/2024/gallery/B24__20240629_180547__Tana.jpg",
        "y": "2024",
        "w": 2048,
        "h": 1365,
        "ar": 1.5,
        "a": "tana",
        "t": null
      },
      {
        "p": "/imgs/years/2024/gallery/B24__20240629_180726__Tana.jpg",
        "y": "2024",
        "w": 2048,
        "h": 1365,
        "ar": 1.5,
        "a": "tana",
        "t": null
      },
      {
        "p": "/imgs/years/2024/gallery/B24__20240630_075335__Tana.jpg",
        "y": "2024",
        "w": 2048,
        "h": 1365,
        "ar": 1.5,
        "a": "tana",
        "t": null
      },
      ...
    ]
  }
}
```

## Minification Mapping
The response uses minified keys to optimize payload size:

- `p`: path (Original public URL)
- `y`: year
- `w`: width
- `h`: height
- `ar`: aspect ratio
- `a`: author (photographer shortcut)
- `t`: title (optional)
