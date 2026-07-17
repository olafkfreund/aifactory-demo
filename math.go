package main

// Clamp constrains value to [low, high].
// It returns value if low <= value <= high, otherwise returns the nearest bound.
// Assumes low <= high.
func Clamp(value, low, high float64) float64 {
	if value < low {
		return low
	} else if value > high {
		return high
	} else {
		return value
	}
}
