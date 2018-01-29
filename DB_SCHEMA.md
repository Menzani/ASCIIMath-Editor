## Database schema

This document describes the schema of the [IndexedDB][1] object database used to store
the user's documents.

Database | Schema version
---|---
ASCIIMath Editor | 1

The schema defines three object stores:

Object store | Key supply | Description | Notes
---|---|---|---
document | auto increment | Stores all documents | Contains pointers to _page_ objects 
page | auto increment | Stores each page of every document | Contains a pointer to a _page_source_ object
page_source | auto increment | Stores the contents of every page

These object stores contain objects defined as follows.
Note that `undefined` means the value is computed dynamically.

### document

Field | Type | Default value | Description | Notes
---|---|---|---|---
focusedPage | Number | `-1` | The page currently being edited on, which is the target of commands | An index in the _pageKeys_ array
pageKeys | Array of Numbers | `[]` | The pages that make up the document (in descending order) | A set of keys in the _page_ object store
scroll | Object | _N/A_ | The `window` scroll position
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; top | Number | `0` | `window.scrollTop`

### page

Field | Type | Default value | Description | Notes
---|---|---|---|---
pageSourceKey | Number | `undefined` | The contents of the page | A key in the _page_source_ object store
editor | Object | _N/A_ | The `textarea` in the upper, smaller part of the page
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; height | Number | `200` | `textarea.style.height`
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; selection | Object | _N/A_ | The `textarea` selection
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; start | Number | `0` | `textarea.selectionStart`
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; end | Number | `0` | `textarea.selectionEnd`
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; scroll | Object | _N/A_ | The `textarea` scroll position
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; top | Number | `0` | `textarea.scrollTop`
view | Object | _N/A_ | The `div` in the lower, bigger part of the page
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; scroll | Object | _N/A_ | The `div` scroll positions
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; left | Number | `0` | `div.scrollLeft`
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; top | Number | `0` | `div.scrollTop`

### page_source

Field | Type | Default value | Description | Notes
---|---|---|---|---
value | String | `""` | `textarea.value` where `textarea` is the page editor

## Design conventions

* Object store names are singular nouns.
* Object store names are lower snake case.

## Design notes

A single object store with more fields could be used instead of a few different ones.
However, some degree of separation improves concurrency, because differently-scoped
`readwrite` transactions can run in parallel.
In particular, the _page_source_ object store is supposed to serve the highest volume 
of transactions, thus lightening the load on other stores and potentially resulting in
better parallelism among editing and scrolling.

To implement this, the _document_ object store points to the _page_ object
store, which in turn points to the _page_source_ object store. In fact, _page_ and
_page_source_ objects could be fields that are nested inside _document_ objects.
This architecture effectively resembles a [star schema][2] in a SQL database,
in which tables reference other tables by means of some designated key stored
in multiple columns.


  [1]: https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API
  [2]: https://en.wikipedia.org/wiki/Star_schema