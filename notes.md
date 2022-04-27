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
