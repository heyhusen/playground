package dal

import (
	"context"
	"database/sql"
	"errors"

	"github.com/go-jet/jet/v2/postgres"

	"github.com/heyhusen/playground/api/go/internal/domain/entity"
	"github.com/heyhusen/playground/api/go/internal/domain/repository"
	"github.com/heyhusen/playground/api/go/internal/infrastructure/jet"
)

// UserRepository implements the persistence port with Jet-built SQL.
type UserRepository struct {
	db *sql.DB
}

// NewUserRepository creates a repository backed by db.
func NewUserRepository(db *sql.DB) *UserRepository {
	return &UserRepository{db: db}
}

type scanner interface {
	Scan(dest ...any) error
}

func scanUser(row scanner) (*entity.User, error) {
	var (
		user          entity.User
		lastName      sql.NullString
		nickname      sql.NullString
		createdOffset int64
		updatedOffset int64
	)

	err := row.Scan(
		&user.ID,
		&user.Version,
		&user.Cursor,
		&user.FirstName,
		&lastName,
		&nickname,
		&user.Email,
		&user.CreatedAt,
		&user.UpdatedAt,
		&user.CreatedAtTimezoneName,
		&createdOffset,
		&user.UpdatedAtTimezoneName,
		&updatedOffset,
	)
	if err != nil {
		return nil, err
	}

	user.CreatedAtTimezoneOffset = int(createdOffset)
	user.UpdatedAtTimezoneOffset = int(updatedOffset)

	if lastName.Valid {
		value := lastName.String
		user.LastName = &value
	}

	if nickname.Valid {
		value := nickname.String
		user.Nickname = &value
	}

	return &user, nil
}

func (r *UserRepository) exec(ctx context.Context, stmt postgres.Statement) error {
	query, args := stmt.Sql()
	_, err := r.db.ExecContext(ctx, query, args...)

	return err
}

// Create inserts a user.
func (r *UserRepository) Create(ctx context.Context, user *entity.User) (*entity.User, error) {
	stmt := jet.Users.INSERT(
		jet.Users.ID,
		jet.Users.Version,
		jet.Users.FirstName,
		jet.Users.LastName,
		jet.Users.Nickname,
		jet.Users.Email,
		jet.Users.CreatedAt,
		jet.Users.UpdatedAt,
		jet.Users.CreatedAtTimezoneName,
		jet.Users.CreatedAtTimezoneOffset,
		jet.Users.UpdatedAtTimezoneName,
		jet.Users.UpdatedAtTimezoneOffset,
	).VALUES(
		uuidValue(user.ID),
		postgres.Int64(user.Version),
		postgres.String(user.FirstName),
		nullString(user.LastName),
		nullString(user.Nickname),
		postgres.String(user.Email),
		postgres.Int64(user.CreatedAt),
		postgres.Int64(user.UpdatedAt),
		postgres.String(user.CreatedAtTimezoneName),
		postgres.Int32(int32(user.CreatedAtTimezoneOffset)),
		postgres.String(user.UpdatedAtTimezoneName),
		postgres.Int32(int32(user.UpdatedAtTimezoneOffset)),
	)

	if err := r.exec(ctx, stmt); err != nil {
		return nil, err
	}

	return r.FindByID(ctx, user.ID)
}

func uuidValue(value string) postgres.StringExpression {
	return postgres.CAST(postgres.String(value)).AS_UUID()
}

func nullString(value *string) postgres.Expression {
	if value == nil {
		return postgres.NULL
	}

	return postgres.String(*value)
}

// FindByID returns a user or repository.ErrNotFound.
func (r *UserRepository) FindByID(ctx context.Context, userID string) (*entity.User, error) {
	stmt := postgres.SELECT(jet.Users.AllColumns).
		FROM(jet.Users).
		WHERE(jet.Users.ID.EQ(uuidValue(userID))).
		LIMIT(1)

	query, args := stmt.Sql()
	user, err := scanUser(r.db.QueryRowContext(ctx, query, args...))
	if errors.Is(err, sql.ErrNoRows) {
		return nil, repository.ErrNotFound
	}

	return user, err
}

// FindByEmail returns the user owning email, excluding an optional id.
func (r *UserRepository) FindByEmail(ctx context.Context, email, excludeID string) (*entity.User, error) {
	condition := jet.Users.Email.EQ(postgres.String(email))
	if excludeID != "" {
		condition = condition.AND(jet.Users.ID.NOT_EQ(uuidValue(excludeID)))
	}

	stmt := postgres.SELECT(jet.Users.AllColumns).
		FROM(jet.Users).
		WHERE(condition).
		LIMIT(1)

	query, args := stmt.Sql()
	user, err := scanUser(r.db.QueryRowContext(ctx, query, args...))
	if errors.Is(err, sql.ErrNoRows) {
		return nil, nil
	}

	return user, err
}

// FindAll returns a page of users ordered by cursor and the total count.
func (r *UserRepository) FindAll(ctx context.Context, page, size int) ([]entity.User, int64, error) {
	countStmt := postgres.SELECT(postgres.COUNT(jet.Users.ID)).FROM(jet.Users)
	countQuery, countArgs := countStmt.Sql()

	var total int64
	if err := r.db.QueryRowContext(ctx, countQuery, countArgs...).Scan(&total); err != nil {
		return nil, 0, err
	}

	stmt := postgres.SELECT(jet.Users.AllColumns).
		FROM(jet.Users).
		ORDER_BY(jet.Users.Cursor.ASC()).
		LIMIT(int64(size)).
		OFFSET(int64((page - 1) * size))

	query, args := stmt.Sql()
	rows, err := r.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	users := make([]entity.User, 0)

	for rows.Next() {
		user, err := scanUser(rows)
		if err != nil {
			return nil, 0, err
		}
		users = append(users, *user)
	}

	return users, total, rows.Err()
}

// Update writes all mutable columns of a user.
func (r *UserRepository) Update(ctx context.Context, user *entity.User) (*entity.User, error) {
	stmt := jet.Users.UPDATE(
		jet.Users.FirstName,
		jet.Users.LastName,
		jet.Users.Nickname,
		jet.Users.Email,
		jet.Users.UpdatedAt,
		jet.Users.UpdatedAtTimezoneName,
		jet.Users.UpdatedAtTimezoneOffset,
	).SET(
		postgres.String(user.FirstName),
		nullString(user.LastName),
		nullString(user.Nickname),
		postgres.String(user.Email),
		postgres.Int64(user.UpdatedAt),
		postgres.String(user.UpdatedAtTimezoneName),
		postgres.Int32(int32(user.UpdatedAtTimezoneOffset)),
	).WHERE(jet.Users.ID.EQ(uuidValue(user.ID)))

	if err := r.exec(ctx, stmt); err != nil {
		return nil, err
	}

	return r.FindByID(ctx, user.ID)
}

// Delete removes a user.
func (r *UserRepository) Delete(ctx context.Context, userID string) error {
	stmt := jet.Users.DELETE().WHERE(jet.Users.ID.EQ(uuidValue(userID)))

	query, args := stmt.Sql()
	result, err := r.db.ExecContext(ctx, query, args...)
	if err != nil {
		return err
	}

	affected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if affected == 0 {
		return repository.ErrNotFound
	}

	return nil
}
