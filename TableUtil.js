/*
class TableUtil
{
  static function AddFrontChartColumn(report, table, rowCount)
  {
    // Add Chart Inside Table
    var chartComboValues = CreateChartComboValues();
    var headerChartCombo = CreateHeaderChartCombo(report, chartComboValues);
    table.ColumnHeaders.Insert(0, headerChartCombo);

    var formulaExpression = "IF (row=rows OR row>=" + rowCount + ", EMPTYV(), CELLV(col+1,row)/CELLV(col+1, " + rowCount + ") )";
    var headerFormula = CreateHeaderFormula(formulaExpression);
    table.ColumnHeaders.Insert(1, headerFormula);
  }
  
  private static function CreateChartComboValues( )
  {
    var chartComboValue : ChartComboValue = new ChartComboValue();
    chartComboValue.Name = "";
    chartComboValue.BaseColor = new ChartComboColorSet([Config.Colors.DefaultColor]);
    chartComboValue.Expression = "CELLV(col+1,row)";

    var chartComboValue2 : ChartComboValue = new ChartComboValue();
    chartComboValue2.Name = "";
    chartComboValue2.BaseColor = new ChartComboColorSet(['#FFF']);
    chartComboValue2.Expression = "1-CELLV(col+1,row)";

    return [chartComboValue, chartComboValue2];
  }
  
  private static function CreateHeaderChartCombo(report, chartComboValue)
  {
    var headerChartCombo : HeaderChartCombo = new HeaderChartCombo();
    headerChartCombo.Size = 200;
    headerChartCombo.Thickness = "20px";
    headerChartCombo.Title = new Label(report.CurrentLanguage, "Response Distribution");
    headerChartCombo.TypeOfChart = ChartComboType.Bar;
    headerChartCombo.Values = chartComboValue;
    headerChartCombo.HideHeader = true;
    return headerChartCombo;
  }
  
  private static function CreateHeaderFormula(expression)
  {
    var headerFormula : HeaderFormula = new HeaderFormula();
    headerFormula.Type = FormulaType.Expression;
    headerFormula.HideData = true;
    headerFormula.Expression = expression;
    return headerFormula;
  }
  
  static function ApplySorting(table, question, rowHeaderPosition, sortPosition)
  {
    if(MetaData.IsInCategory(question, "sort"))
    {
      var sortInfo = CreateSortInfo(sortPosition);
      var headerQuestion : HeaderQuestion = table.RowHeaders[rowHeaderPosition];
      headerQuestion.Sorting = sortInfo;
    }
  }
  
  static function CreateSortInfo(sortPosition)
  {
    var sortInfo : SortInfo = new SortInfo();
    sortInfo.Enabled = true;
    sortInfo.Direction = TableSortDirection.Descending;
    sortInfo.SortByType = TableSortByType.Position;
    sortInfo.Position = sortPosition;
    return sortInfo;
  }
}
*/