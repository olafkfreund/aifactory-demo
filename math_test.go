package main

import "testing"

func TestClamp(t *testing.T) {
	tests := []struct {
		name     string
		value    float64
		low      float64
		high     float64
		expected float64
	}{
		{
			name:     "Value within range",
			value:    5.0,
			low:      0.0,
			high:     10.0,
			expected: 5.0,
		},
		{
			name:     "Value below range",
			value:    -5.0,
			low:      0.0,
			high:     10.0,
			expected: 0.0,
		},
		{
			name:     "Value above range",
			value:    15.0,
			low:      0.0,
			high:     10.0,
			expected: 10.0,
		},
		{
			name:     "Value equals low",
			value:    0.0,
			low:      0.0,
			high:     10.0,
			expected: 0.0,
		},
		{
			name:     "Value equals high",
			value:    10.0,
			low:      0.0,
			high:     10.0,
			expected: 10.0,
		},
		{
			name:     "Negative ranges",
			value:    -5.0,
			low:      -10.0,
			high:     -2.0,
			expected: -5.0,
		},
		{
			name:     "Negative range with value below",
			value:    -15.0,
			low:      -10.0,
			high:     -2.0,
			expected: -10.0,
		},
		{
			name:     "Single point range",
			value:    5.0,
			low:      5.0,
			high:     5.0,
			expected: 5.0,
		},
		{
			name:     "Floating point precision",
			value:    3.14159,
			low:      0.0,
			high:     5.0,
			expected: 3.14159,
		},
		{
			name:     "Large numbers",
			value:    1e10,
			low:      1e9,
			high:     1e11,
			expected: 1e10,
		},
		{
			name:     "Large number below range",
			value:    1e8,
			low:      1e9,
			high:     1e11,
			expected: 1e9,
		},
		{
			name:     "Negative value in positive range",
			value:    -100.0,
			low:      0.0,
			high:     100.0,
			expected: 0.0,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := Clamp(tt.value, tt.low, tt.high)
			if result != tt.expected {
				t.Errorf("Clamp(%v, %v, %v) = %v; expected %v", tt.value, tt.low, tt.high, result, tt.expected)
			}
		})
	}
}
