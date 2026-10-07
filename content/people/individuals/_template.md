---
# general information about the person
# should be defined, otherwise page might not work properly
name: "Name" # mandatory property

# use only existing images, otherwise page looks bad
image: "" # /imgs/people/xxx.jpg

nickname: ""
roleTitle: "" # default role title across the site
description: "" # default bio description across the site

# optional

# whether the person is no longer participating in Bestvina preparation [default: false]
isFormer: false

# hide from all lists [default: false]
isHidden: false

# whether the person is an external guest [default: false]
isExternal: false

# Two-tier cascade overrides:
# Key can be a tab ID (e.g. 'vedeni', 'chemie') or a subsection ID (e.g. 'chemie_prednasejici', 'vedeni_hlavni')
# Resolution order: subOverride?.field ?? tabOverride?.field ?? person[field]
overrides:
  vedeni:
    roleTitle: ""
    description: ""
  chemie_prednasejici:
    roleTitle: ""
    description: ""
---
[//]: # (here, personal website can be defined using Markdown, that will be rendered with MDC)
[//]: # (this is not yet implemented, tho)