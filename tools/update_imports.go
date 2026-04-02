package main

import (
	"bytes"
	"fmt"
	"io/fs"
	"os"
	"path/filepath"
)

func main() {
	err := filepath.WalkDir("internal", func(path string, d fs.DirEntry, err error) error {
		if err != nil {
			return err
		}
		if !d.IsDir() && filepath.Ext(path) == ".go" {
			content, err := os.ReadFile(path)
			if err != nil {
				return err
			}
			newContent := bytes.ReplaceAll(content, []byte("\"beidar/internal"), []byte("\"bard/internal"))
			newContent = bytes.ReplaceAll(newContent, []byte("\"beidar/pkg"), []byte("\"bard/pkg"))
			if !bytes.Equal(content, newContent) {
				fmt.Println("Updated:", path)
				return os.WriteFile(path, newContent, 0644)
			}
		}
		return nil
	})
	if err != nil {
		fmt.Println("Error:", err)
	}

	// also do it for pkg
	err = filepath.WalkDir("pkg", func(path string, d fs.DirEntry, err error) error {
		if err != nil {
			return err
		}
		if !d.IsDir() && filepath.Ext(path) == ".go" {
			content, err := os.ReadFile(path)
			if err != nil {
				return err
			}
			newContent := bytes.ReplaceAll(content, []byte("\"beidar/internal"), []byte("\"bard/internal"))
			newContent = bytes.ReplaceAll(newContent, []byte("\"beidar/pkg"), []byte("\"bard/pkg"))
			if !bytes.Equal(content, newContent) {
				fmt.Println("Updated:", path)
				return os.WriteFile(path, newContent, 0644)
			}
		}
		return nil
	})
	if err != nil {
		fmt.Println("Error updating pkg:", err)
	}
}
