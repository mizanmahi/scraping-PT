//const axios = require('axios');


const pattern = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/;
const htmlContent = fetch('https://out.psychologytoday.com/us/profile/398490/website-redirect?_ga=2.242270594.1285330155.1596203882-512347135.1596038085').then(res => console.log(res.url) )
// let pattern = /^mizan\smahi$/i;
// let name = 'mizan mahi';

// const milse = name.match(pattern);
// console.log(milse[0]);

//const link = new URL('https://www.google.com/search?rlz=1C1CHBF_enBD892BD892&sxsrf=ALeKk00PFi9PvGWTlmolXkg9oMZ9R2qOFg%3A1596218677072&ei=NV0kX4OEBMeclwSP6oOAAw&q=regex+to+extract+email+address+from+string&oq=regex+for+extracting+email+&gs_lcp=CgZwc3ktYWIQAxgAMgYIABAWEB4yBggAEBYQHjIGCAAQFhAeMgYIABAWEB4yBggAEBYQHjIGCAAQFhAeMgYIABAWEB4yBggAEBYQHjIGCAAQFhAeMgYIABAWEB46BAgjECc6BQgAEJECOgQIABBDOgUIABCxAzoCCAA6BAguEEM6CgguELEDEIMBEENQ1uGDAliFp4QCYJrBhAJoAHAAeACAAYMFiAHDTpIBCjItMjAuNC4zLjOYAQCgAQGqAQdnd3Mtd2l6wAEB&sclient=psy-ab');

//console.log(link.origin);