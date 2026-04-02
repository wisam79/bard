package logger

import (
	"fmt"
	"log"
	"os"
	"path/filepath"
	"runtime"
	"time"
)

// Level represents log level
type Level int

const (
	LevelDebug Level = iota
	LevelInfo
	LevelWarn
	LevelError
	LevelFatal
)

// Logger provides structured logging
type Logger struct {
	level     Level
	file      *os.File
	stdLogger *log.Logger
	fields    map[string]interface{}
}

// New creates a new logger instance
func New(level Level, fileLogging bool) *Logger {
	l := &Logger{
		level:     level,
		stdLogger: log.New(os.Stdout, "", 0),
		fields:    make(map[string]interface{}),
	}

	if fileLogging {
		configDir, err := os.UserConfigDir()
		if err == nil {
			logDir := filepath.Join(configDir, "BeidarPOS", "logs")
			os.MkdirAll(logDir, 0755)
			logPath := filepath.Join(logDir, fmt.Sprintf("app_%s.log", time.Now().Format("2006-01-02")))
			f, err := os.OpenFile(logPath, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
			if err == nil {
				l.file = f
			}
		}
	}

	return l
}

func (l *Logger) log(level Level, levelStr, msg string, args ...interface{}) {
	if level < l.level {
		return
	}

	_, file, line, _ := runtime.Caller(2)
	timestamp := time.Now().Format("2006-01-02 15:04:05")
	fileName := filepath.Base(file)

	attrs := ""
	for k, v := range l.fields {
		attrs += fmt.Sprintf(" %s=%v", k, v)
	}
	for i := 0; i < len(args); i += 2 {
		if i+1 < len(args) {
			attrs += fmt.Sprintf(" %v=%v", args[i], args[i+1])
		}
	}

	entry := fmt.Sprintf("[%s] %s %s:%d %s%s", timestamp, levelStr, fileName, line, msg, attrs)

	l.stdLogger.Println(entry)
	if l.file != nil {
		l.file.WriteString(entry + "\n")
	}
}

func (l *Logger) Debug(msg string, args ...interface{}) {
	l.log(LevelDebug, "DEBUG", msg, args...)
}

func (l *Logger) Info(msg string, args ...interface{}) {
	l.log(LevelInfo, "INFO", msg, args...)
}

func (l *Logger) Warn(msg string, args ...interface{}) {
	l.log(LevelWarn, "WARN", msg, args...)
}

func (l *Logger) Error(msg string, args ...interface{}) {
	l.log(LevelError, "ERROR", msg, args...)
}

func (l *Logger) Fatal(msg string, args ...interface{}) {
	l.log(LevelFatal, "FATAL", msg, args...)
	os.Exit(1)
}

func (l *Logger) Close() {
	if l.file != nil {
		l.file.Close()
	}
}

// WithContext adds a field to the logger and returns a new instance
func (l *Logger) WithContext(key string, value interface{}) *Logger {
	newFields := make(map[string]interface{})
	for k, v := range l.fields {
		newFields[k] = v
	}
	newFields[key] = value

	return &Logger{
		level:     l.level,
		file:      l.file,
		stdLogger: l.stdLogger,
		fields:    newFields,
	}
}

// Audit logs an audit event
func (l *Logger) Audit(action string, staffID string, details string) {
	l.log(LevelInfo, "AUDIT", action, "staffId", staffID, "details", details)
}
