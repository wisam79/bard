package migration

import (
	"database/sql"
	"embed"
	"fmt"
	"log/slog"

	"github.com/pressly/goose/v3"
)

//go:embed *.sql
var embedMigrations embed.FS

// Runner handles database migrations using goose.
type Runner struct {
	db  *sql.DB
	log *slog.Logger
}

// NewRunner creates a new migration runner.
// It accepts a raw *sql.DB (not a GORM *gorm.DB).
func NewRunner(db *sql.DB, log *slog.Logger) *Runner {
	return &Runner{db: db, log: log}
}

// Up runs all pending migrations.
func (r *Runner) Up() error {
	goose.SetBaseFS(embedMigrations)

	if err := goose.SetDialect("sqlite3"); err != nil {
		return fmt.Errorf("goose set dialect: %w", err)
	}

	r.log.Info("Running database migrations...")

	if err := goose.Up(r.db, "."); err != nil {
		return fmt.Errorf("goose up: %w", err)
	}

	version, err := goose.GetDBVersion(r.db)
	if err != nil {
		return fmt.Errorf("goose get version: %w", err)
	}

	r.log.Info("Database migrations complete", "version", version)
	return nil
}

// Status prints the status of all migrations.
func (r *Runner) Status() error {
	goose.SetBaseFS(embedMigrations)

	if err := goose.SetDialect("sqlite3"); err != nil {
		return fmt.Errorf("goose set dialect: %w", err)
	}

	return goose.Status(r.db, ".")
}

// Version returns the current database version.
func (r *Runner) Version() (int64, error) {
	goose.SetBaseFS(embedMigrations)

	if err := goose.SetDialect("sqlite3"); err != nil {
		return 0, fmt.Errorf("goose set dialect: %w", err)
	}

	return goose.GetDBVersion(r.db)
}
