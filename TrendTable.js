class TrendTable
{
  private var _report;
  private var _state;
  private var _table;
  private var _log;
  private var _statistic;
  private var _question;
  private var _metricVariableId;
  private var _timeSeriesHeader;
  const TimeVariableHeaderId = "dt";
  const CategoriesId = "cat";

  function TrendTable(report, state, table, parameterInfo, timeSeriesHeader,  log)
  {
    _report = report;
    _state = state;
    _table = table;
    _timeSeriesHeader = timeSeriesHeader;
    _statistic = ParamUtil.Selected(report, state, parameterInfo.StatisticName);
    _metricVariableId = ParamUtil.GetParamCode(state, parameterInfo.MetricName);
    var questionId = _metricVariableId.split(".")[0];
    _question = MetaData.GetQuestion2(report, DS.Main, questionId, true, log);
    _log = log;
  }
  
  function CreateBaseTableExpression()
  {
    return [CreateBaseRowExpression(), _timeSeriesHeader.CreateBaseTimeseriesExpression(false)].join('^');
  }
  
  function CreateBaseRowExpression()
  {
    var rowExpression = _metricVariableId + MetricVariableQualifiers();
    var topBottomNExpression = CreateTopBottomNExpression();
    if(topBottomNExpression != null)
      rowExpression += "/" + topBottomNExpression;
    return rowExpression;
  }
  
  private function MetricVariableQualifiers()
  {
    if(_statistic.Code == "2")
      return '{collapsed:true;defaultstatistics:stdev}'
    else
      return '{collapsed:true;defaultstatistics:avg}'
  }
    
  private function CreateTopBottomNExpression()
  {
    if(_statistic.Code == "3" || _statistic.Code == "4" || _statistic.Code == "5" || _statistic.Code == "6" || _statistic.Code == "7" || _statistic.Code == "8" ) 
    {
      var topAndBottomScales = FindTopAndBottom3Scales();
      var rowExpressionSegments = [];
      rowExpressionSegments.push(GetMaskedCategoriesSet(topAndBottomScales, CategoriesId, true, false))
      rowExpressionSegments.push(CreateFormulaHeader());
      return "(" + rowExpressionSegments.join("+") + ")";
    }
    return null;
  }               
  
  private function FindTopAndBottom3Scales()
  {
    var scales = _question.Scale;
    var sortedScales = scales.sort(SortUtil.SortByScoreAscending);
    return [sortedScales[0].Code,sortedScales[1].Code,sortedScales[2].Code,
            sortedScales[sortedScales.length-3].Code,sortedScales[sortedScales.length-2].Code,sortedScales[sortedScales.length-1].Code];
  }
  
  private function GetMaskedCategoriesSet(codeSet, id, hideData, totals)
  {
    var maskedCategories = [];
    for(var i = 0; i < codeSet.length; i++)
    {
      maskedCategories.push("[CATEGORIES]{totals:" + totals + ";id:" + id + ";hidedata:" + hideData + ";mask:" + codeSet[i] + "}");
    }
    return maskedCategories.join("+");
  }
  
  private function CreateFormulaHeader()
  {
    return "[FORMULA]{percent:true;expression:\"" + GetFormulaExpression() + "\"}"
  }
  
  private function GetFormulaExpression()
  {
    switch(_statistic.Code)
    {
      case "3":
        return "(CELLVALUE(col,row-2) + CELLVALUE(col, row-1))/100";
      case "4":
        return "(CELLVALUE(col,row-3) + CELLVALUE(col,row-2) + CELLVALUE(col, row-1))/100";
      case "5":
        return "(CELLVALUE(col,row-6) + CELLVALUE(col, row-5))/100";
      case "6":
        return "(CELLVALUE(col,row-6) + CELLVALUE(col, row-5) + CELLVALUE(col, row-4))/100";
      case "7":
        return "CELLVALUE(col, row-1)/100";
      case "8":
        return "CELLVALUE(col,row-6)/100";
    }
  }
  
  function SetFormulasFirstOnCategories(formulasFirst)
  {
    SetFormulasFirst(_table.RowHeaders, formulasFirst);
  }
  
  private function SetFormulasFirst(headersCollection, formulasFirst) 
  {
	for (var i = 0; i < headersCollection.Count; ++i) 
    {
	  if (headersCollection[i].HeaderId == CategoriesId)
      {
        headersCollection[i].Mask.ApplyAfterFormulas = formulasFirst;
      }
	  // See if there's a match in that header's Child Branches
	  if(headersCollection[i].SubHeaders != null)
        SetFormulasFirst(headersCollection[i].SubHeaders, formulasFirst);
    }
  }
}