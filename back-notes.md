### Database Objects

Ticket:

- id
- price
- expireTime
- sellerId
- location

```
CREATE TABLE tickets
  (
     id          INT PRIMARY KEY auto_increment,
     price       FLOAT NOT NULL,
     datetime    DATETIME NOT NULL,
     seller_id   INT NOT NULL,
     latitude    FLOAT NOT NULL,
     longitude   FLOAT NOT NULL,
     FOREIGN KEY(seller_id) REFERENCES users(id) ON DELETE CASCADE
  )
```

User:

- id
- username
- hash

```
CREATE TABLE users
  (
     id       INT PRIMARY KEY auto_increment,
     username VARCHAR(40) UNIQUE NOT NULL,
     hash     TEXT NOT NULL
  );
```

Reviews:

- author_id
- recipient_id
- score out of 5
- (maybe) message?

```
CREATE TABLE reviews
  (
     id           INT PRIMARY KEY auto_increment,
     author_id    INT,
     recipient_id INT NOT NULL,
     rating       FLOAT NOT NULL,
     message      TEXT,
     FOREIGN KEY(author_id) REFERENCES users(id) ON DELETE SET NULL,
     FOREIGN KEY(recipient_id) REFERENCES users(id) ON DELETE CASCADE
  );
```

---

### Routes:

- landing (purely a view / redirect page)
- map
- table\*
- auth (login / register)\*
- create ticket sale\*

All of the routes marked with \* could be implemented as a modal within the map page.
