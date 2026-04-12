package domain

type AnalyticsInsight struct {
	Type        string  `json:"type"`
	Title       string  `json:"title"`
	Description string  `json:"description"`
	Severity    string  `json:"severity"`
	Value       float64 `json:"value,omitempty"`
	Metric      string  `json:"metric,omitempty"`
	Period      string  `json:"period,omitempty"`
}

type SalesForecast struct {
	Date       string  `json:"date"`
	Predicted  float64 `json:"predicted"`
	LowerBound float64 `json:"lowerBound"`
	UpperBound float64 `json:"upperBound"`
}

type ProfitAnalysis struct {
	Period  string  `json:"period"`
	Revenue float64 `json:"revenue"`
	Cost    float64 `json:"cost"`
	Profit  float64 `json:"profit"`
	Margin  float64 `json:"margin"`
	Growth  float64 `json:"growth"`
}

type DemandForecast struct {
	ProductID       string  `json:"productId"`
	ProductName     string  `json:"productName"`
	CurrentQty      float64 `json:"currentQty"`
	PredictedDemand float64 `json:"predictedDemand"`
	DaysOfStock     float64 `json:"daysOfStock"`
	ReorderDate     string  `json:"reorderDate"`
	Urgency         string  `json:"urgency"`
}

type AnomalyDetection struct {
	Metric      string  `json:"metric"`
	Date        string  `json:"date"`
	Expected    float64 `json:"expected"`
	Actual      float64 `json:"actual"`
	Deviation   float64 `json:"deviation"`
	IsAnomaly   bool    `json:"isAnomaly"`
	Description string  `json:"description"`
}

type AnalyticsDashboard struct {
	Insights  []AnalyticsInsight `json:"insights"`
	Forecasts []SalesForecast    `json:"forecasts"`
	Profits   []ProfitAnalysis   `json:"profits"`
	Demands   []DemandForecast   `json:"demands"`
	Anomalies []AnomalyDetection `json:"anomalies"`
}
