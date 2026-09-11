# House Cup API

Canonical backend for the House Cup tournament platform.

## Stack

- Spring Boot 3.3
- Spring Web + Validation
- Spring Data JPA / Hibernate
- MySQL

## Run locally

Set `MYSQL_URL`, `MYSQL_USER`, and `MYSQL_PASSWORD`, then run:

```bash
mvn spring-boot:run
```

The service uses `/api` as its context path and seeds a small St. Xavier's event when the database is empty. `spring.jpa.hibernate.ddl-auto=update` keeps the first local setup straightforward; use versioned migrations before production rollout.