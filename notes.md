### Database:

To create a new database simply:
create database db_name; needs root privileges

To give a user all permissions on that database:
GRANT ALL PRIVILEGES ON db_name.\* TO 'username'@'localhost (or server)' WITH GRANT OPTION; the grant option makes it so the user can give those privileges to other users as well.

If a table has a reference to the id key of another table you can declare it as a foreign key.
Declare every other field and then
`FOREIGN KEY(column_name) REFERENCES other_table(id_column) ON DELETE CASCADE`
this will make it so when you delete the row with a given id in other table all data that references that id will
be deleted as well.
Another option is instead of CASCADE: `SET NULL`.

## npm-mysql: execute passes parameters as a serialized string, query if for substituting them client side (where with client we're talking about the node server, right?)

### React Routing:

This is the current documentation, starting page and examples are outdated
https://reactrouter.com/docs/en/v6/upgrading/v5#upgrade-to-react-router-v6

---

### Typescript

Typescript prevents modification to the request object by default. To solve this I had to:

- create a `custom.d.ts` file in my directory, with specified

```
import {Express} from 'express-serve-static-core';
declare module 'express-serve-static-core' {
    interface Request {
        user: object
    }
}
```

this modifies the request object so that it can accept the new property. I don't know why this adds to the base instead
of substituting.

Typescript won't complain any more but ts-node (the service that runs typescript files without having to compile them first will) and so will nodemon since it uses ts-node for .ts files.
To fix that I created a `nodemon.json` file in the directory:

```
{
    "execMap" : {
        "ts" : "ts-node --files"
    }
}
```

This specifies that whenever nodemon is run it should providie the --file option to ts-node. Now everything works.

---

### Javascript

To time things I can use
`console.time(timerName)`, do what I want and then `console.timeEnd(timerName)`

```
function timeIt(fun, argumentsArray, iterations){
    console.time(fun.name);
    for (let i = 0; i < iterations; i++)
        fun.apply(null, argumentsArray);
    console.timeEnd(fun.name);
}
```

This morning has been so shit.
I tried getting the nominatim api to work like it did on the other project by using a npm package as a middleman since I thought the problem
was making direct requests from the browser and that didn't work. Which means my other project doesn't work either. I don't know if it's
because I made repetitive request while developing or if their api is having problems.
Eiher way I then found another provider. I could not get to testing it in the browser for some reason so I tried setting up an api route in order
to also create a cache through a map of the searches I do (to avoid making the same mistake I did the first time).
That's when I discovered that fetch is not defined in node. So now I'm trying to install a npm package and guess what?
Npm install is stuck. I don't know if this is going to have types, otherwise some more fighting useless problems incoming.

Ok, next day. OSM didn't blacklist me, it was just having problems I guess.
Node fetch v3+ works only with imports. By default typescript is compiled to commonjs so it would use requires and that would not work.
Making typescript compile to ESM seems experimental and I didn't want to work through endless issues right now so I just reverted node-fetch to v2
which is fine with requires. Maybe when I'm more comfortable with this development environment I'll switch to ESM compilation.

I found mapquest which is a commercial project that has a free tier and it seems to have good geocoding, differently from the service I was using yesterday.
I'll start using this one so I don't put load on OSM. I have an half idea of saving my cached results to db but not sure if worth it.

Current problem:
Every time something changes within the map the component is drawn again.
What happens is that since i have an empty array in in useEffect that part only runs on first didMount. The other variables though get re-instantiated I think
and that's why after an update they start pointing to nothing.
I can't take all the code out of useEffect because for some reason that doesn't work. Maybe I can put it all inside?
I can't also put it all inside without the array because every time it refreshes it creates a new map, again not sure why.
