package logger

import (
	"fmt"
	"log/slog"
	"os"
	"path/filepath"
	"time"
)

// Level represents log level, mapped to slog levels
type Level slog.Level

const (
	LevelDebug Level = Level(slog.LevelDebug)
	LevelInfo  Level = Level(slog.LevelInfo)
	LevelWarn  Level = Level(slog.LevelWarn)
	LevelError Level = Level(slog.LevelError)
)

// Logger wraps slog.Logger for backward compatibility
type Logger struct {
	sl   *slog.Logger
	file *os.File
}

// New creates a new structured logger instance using log/slog
func New(level Level, fileLogging bool) *Logger {
	var handler slog.Handler
	var file *os.File

	opts := &slog.HandlerOptions{
		Level: slog.Level(level),
	}

	if fileLogging {
		configDir, err := os.UserConfigDir()
		if err == nil {
			logDir := filepath.Join(configDir, "BardPOS", "logs")
			os.MkdirAll(logDir, 0755)
			logPath := filepath.Join(logDir, fmt.Sprintf("app_%s.log", time.Now().Format("2006-01-02")))
			f, err := os.OpenFile(logPath, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
			if err == nil {
				file = f
				// Multi-writer for stdout and file
				handler = slog.NewJSONHandler(file, opts)
				// Note: in a real app, we might use a multi-handler to log to both stdout (Text) and file (JSON)
			}
		}
	}

	if handler == nil {
		handler = slog.NewTextHandler(os.Stdout, opts)
	}

	sl := slog.New(handler)
	slog.SetDefault(sl)

	return &Logger{
		sl:   sl,
		file: file,
	}
}

func (l *Logger) Debug(msg string, args ...any) {
	l.sl.Debug(msg, args...)
}

func (l *Logger) Info(msg string, args ...any) {
	l.sl.Info(msg, args...)
}

func (l *Logger) Warn(msg string, args ...any) {
	l.sl.Warn(msg, args...)
}

func (l *Logger) Error(msg string, args ...any) {
	l.sl.Error(msg, args...)
}

func (l *Logger) Close() {
	if l.file != nil {
		l.file.Sync()
		l.file.Close()
	}
}

// WithContext adds a field to the logger and returns a new instance
func (l *Logger) WithContext(key string, value any) *Logger {
	return &Logger{
		sl:   l.sl.With(slog.Any("context", map[string]any{key: value})),
		file: l.file,
	}
}

// Audit logs an audit event explicitly
func (l *Logger) Audit(action string, staffID string, details string) {
	l.sl.Info("AUDIT_ACTION",
		slog.String("action", action),
		slog.String("staffId", staffID),
		slog.String("details", details),
	)
}

// internal implementation to expose the raw slog logger if needed
func (l *Logger) Slog() *slog.Logger {
	return l.sl
}
