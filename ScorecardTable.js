class ScorecardTable
{
  static function GetTimeseriesUnit(selected)
  {
    switch( selected.Unit )
    {
      case RollingUnitType.Year:
        return null; 
      case RollingUnitType.Quarter:
        return TimeseriesTimeUnitType.Quarter;
      case RollingUnitType.Month:
        return TimeseriesTimeUnitType.Month;
      case RollingUnitType.Week:
        return TimeseriesTimeUnitType.Week;
      default:
        return null;    
    }
  }
    
  static function CreateRollingTimeSeries(selected, interval)
  {
    var rollingTimeSeries : RollingTime = new RollingTime();
    rollingTimeSeries.Enabled = true;
    rollingTimeSeries.Unit = selected.Unit;
    rollingTimeSeries.To = selected.Delta;
    rollingTimeSeries.From = selected.Delta - parseInt (interval);
    return rollingTimeSeries;
  }
  
  static function UpdateBarChart (bar : HeaderChartCombo) 
  { 
    bar.TypeOfChart = ChartComboType.Bar;  
    bar.Size = 150;
    bar.Thickness = "20px";
    var chartComboValue1 : ChartComboValue = GetChartComboValue ('%', '#107C0F', 'CELLV(col-2,row)');
    var chartComboValue2 : ChartComboValue = GetChartComboValue ('%', '#DC3C00', 'CELLV(col-1,row)');
    bar.Values = [chartComboValue1, chartComboValue2];
    return bar;
  }

  static function GetChartComboValue (label, color, formula) 
  {
    var chartComboValue : ChartComboValue = new ChartComboValue();
    chartComboValue.Name = label;
    chartComboValue.BaseColor = new ChartComboColorSet([ color ]);
    chartComboValue.Expression = formula;
	return chartComboValue;
  }

  static function GetExpression(report, state, showAll, log)
  {
	var epression = [ GetVerticalExpression(report, state, showAll, log), GetHorizontalExpression(report, state, showAll, log) ].join('^');
	return epression;
  }
	
  static function GetHorizontalExpression(report, state, showAll, log)
  {
  }

  static function GetVerticalExpression(report, state, showAll, log)
  {
    var metrics = ParamUtil.GetParamCodes ( state, 'SCORECARD_METRICS' );      
    var verticalExpression = [];	
    for (var i = 0; i < metrics.length; ++i)
    {		
      var nestedHeaders = CreateNestedHeaders(state);
	  var statisticsHeaders = CreateStatisticsHeaders(report, state, showAll, metrics[i], log);			
      nestedHeaders.push ('(' + statisticsHeaders + ')');
      verticalExpression.push ( metrics[i] + '{collapsed:true; totals:false;title:true}/' + nestedHeaders.join('/') );
    }
    return verticalExpression.join('+');
  }
  
  static function CreateStatisticsHeaders(report, state, showAll, metric, log)
  {
    var analysis = CreateAnalysis(report, metric);
    var baseExpression = GetBaseExpression(state, showAll, log)
    var statisticsExpression = GetStatisticsExpression(state, showAll, log);
    var statisticsHeaders = [];
    if(baseExpression != null)
      statisticsHeaders.push (baseExpression);
    if (statisticsExpression != null)
      statisticsHeaders.push (statisticsExpression);
    statisticsHeaders.push ( ScoredItemExpression(report, state, analysis, showAll) );
    statisticsHeaders.push ( Top1Expression(report, state, analysis, showAll) );
    statisticsHeaders.push ( Top2Expression(report, state, analysis, showAll) );				
    statisticsHeaders.push ( Top3Expression(report, state, analysis, showAll) );
    statisticsHeaders.push ( Bottom1Expression(report, state, analysis, showAll) );		
    statisticsHeaders.push ( Bottom2Expression(report, state, analysis, showAll) );				
    statisticsHeaders.push ( Bottom3Expression(report, state, analysis, showAll) );
    return statisticsHeaders.join('+');
  }
  
  static function CreateAnalysis(report, metric)
  {
    var parts = metric.split('.');
    var questionId = parts[0];
    var code = (parts.length > 1) ? parts[1] : null;
    var question = report.DataSource.GetProject(DS.Main).GetQuestion( questionId );
    var analysis = GetAnalysis( question, code );
    return analysis
  }
  
  static function CreateNestedHeaders(state)
  {
    var nestingLevel1 = ParamUtil.GetParamCode ( state, 'SCORECARD_NESTING_LEVEL_1' );
    var nestingLevel2 = ParamUtil.GetParamCode ( state, 'SCORECARD_NESTING_LEVEL_2' );
    var nestingHeaders = [];
    if (nestingLevel1 != null) 
      nestingHeaders.push (nestingLevel1 + '{totals:false}');
    if (nestingLevel2 != null) 
      nestingHeaders.push (nestingLevel2 + '{totals:false}');
    return nestingHeaders;
  }
  
  static function GetBaseExpression(state, showAll, log)
  {
    var o=[];
    if (ParamUtil.Contains (state, 'SCORECARD_STATISTICS', '0'))
      o.push ('[BASE]{decimals:0}');
    else 
      o.push (DummyRow(showAll));
    return o.join('+');
  }
	
  static function GetStatisticsExpression(state, showAll, log)
  {
    var o=[];
    if (ParamUtil.Contains (state, 'SCORECARD_STATISTICS', '1'))
      o.push ('[STATISTICS]{stats:avg}');
    else 
      o.push (DummyRow(showAll));
    if (ParamUtil.Contains (state, 'SCORECARD_STATISTICS', '2'))
      o.push ('[STATISTICS]{stats:stdev}'); 
    else 
      o.push (DummyRow(showAll));
    return o.join('+');
  }

  static function SegmentExpression(report, analysis, label, codes, offset, hide, showAll)
  {
    var o=[];
    var filter = CreateFilter(codes, analysis);
    var hidedata = (showAll) ? false : true; 
		
    o.push ('[SEGMENT]{hidedata:' + hidedata + '; label:' + report.TableUtils.EncodeJsString(label) + '; expression:' + report.TableUtils.EncodeJsString(filter) + '}/[N]{hidedata:' + hidedata + '}');
		
    // Formula
    var hidedata = (showAll) ? false : (hide==true);
    var fn = 'IF(CELLV(col, row-' + (offset+1) + ')=0, EMPTYV(), CELLV(col,row-1)/CELLV(col, row-' + (offset+1) + '))';
    if (showAll)
      o.push ('[FORMULA]{hidedata:' + hidedata + ';percent:true; label:' + report.TableUtils.EncodeJsString(label) + '; expression:' + report.TableUtils.EncodeJsString(fn) + '}/[N]{hideheader:true; hidedata:' + hidedata + '}');
    else
      o.push ('[CONTENT]{hidedata:' + hidedata + ';percent:true; label:' + report.TableUtils.EncodeJsString(label) + '}');			
    return o.join('+');		
  }
  
  static function CreateFilter(codes, analysis)
  {
    var quotedCodes = QuoteStringsInArray(codes);		
    var varibaleId = analysis.VariableId + (analysis.Code == null ? '' : '_' + analysis.Code);
    var filter = 'IN(' + varibaleId + ',' + quotedCodes.join(',') + ')';
    return filter
  }
  
  static function QuoteStringsInArray(inputArray)
  {
    var quotedArray = [];
    for (var i = 0; i < inputArray.length; ++i)
      quotedArray.push ('"' + inputArray[i] + '"');
    return quotedArray;
  }
	
  static function DummyRow(showAll)
  {
    var hidedata = !showAll;
    return '[CONTENT]{hidedata:' + hidedata + '}';
  }	
	
  static function DummyRows(showAll)
  {
    var hidedata = !showAll;
    return '[CONTENT]{hidedata:' + hidedata + '}+[CONTENT]{hidedata:' + hidedata + '}';
  }
	
  static function Top1Expression(report, state, analysis, showAll)
  {
    if ( ParamUtil.Contains (state, 'SCORECARD_STATISTICS', '7'))
      return SegmentExpression (report, analysis, 'Top', analysis.Top, 2, false, showAll);
    else
      return DummyRows(showAll);		
  }
  
  static function Top2Expression(report, state, analysis, showAll)
  {
    if ( ParamUtil.Contains (state, 'SCORECARD_STATISTICS', '3'))
      return SegmentExpression (report, analysis, 'Top 2', analysis.Top2, 4, false, showAll);
    else
      return DummyRows(showAll);		
  }

  static function Top3Expression(report, state, analysis, showAll)
  {
    if ( ParamUtil.Contains (state, 'SCORECARD_STATISTICS', '4'))
      return SegmentExpression (report, analysis, 'Top 3', analysis.Top3, 6, false, showAll);
    else
      return DummyRows(showAll);		
  }

  static function Bottom1Expression(report, state, analysis, showAll)
  {
    if ( ParamUtil.Contains (state, 'SCORECARD_STATISTICS', '8'))
      return SegmentExpression (report, analysis, 'Bottom', analysis.Bottom, 8, false, showAll);
    else
      return DummyRows(showAll);		
  }

  static function Bottom2Expression(report, state, analysis, showAll)
  {
    if ( ParamUtil.Contains (state, 'SCORECARD_STATISTICS', '5'))
      return SegmentExpression (report, analysis, 'Bottom 2', analysis.Bottom2, 10, false, showAll);
    else
      return DummyRows(showAll);		
  }

  static function Bottom3Expression(report, state, analysis, showAll)
  {
    if ( ParamUtil.Contains (state, 'SCORECARD_STATISTICS', '6'))
      return SegmentExpression (report, analysis, 'Bottom 3', analysis.Bottom3, 12, false, showAll);
    else 
      return DummyRows(showAll);		
  }
		
  static function ScoredItemExpression(report, state, analysis, showAll) 
  {
    return SegmentExpression (report, analysis, 'N (scored)', analysis.ScoredCodes, 0, true, showAll);
  }	
	
  static function GetAnalysis(question : Question, code)
  {
    var scales : Answer[] = (question.QuestionType == QuestionType.Grid) ? question.GetScale() : question.GetAnswers();
    var scoredScales = GetScoredScales(scales);
    var sortedScoredScales = scoredScales.sort(SortUtil.SortByWeightAscending);
      
    return {
			VariableId: question.QuestionId,
			Code: code,
            Bottom: GetCodesFromAnswers(sortedScoredScales.slice(0, 1)),
			Bottom2: GetCodesFromAnswers(sortedScoredScales.slice(0, 2)),
			Bottom3: GetCodesFromAnswers(sortedScoredScales.slice(0, 3)),
            Top: GetCodesFromAnswers(sortedScoredScales.slice(sortedScoredScales.length-1, sortedScoredScales.length)),
			Top2: GetCodesFromAnswers(sortedScoredScales.slice(sortedScoredScales.length-2, sortedScoredScales.length)),
			Top3: GetCodesFromAnswers(sortedScoredScales.slice(sortedScoredScales.length-3, sortedScoredScales.length)),
            ScoredCodes: GetCodesFromAnswers(scoredScales)
    };
  }
  
  static function GetScoredScales(scales)
  {
    var scoredScales = [];
    for (var i = 0; i < scales.length; ++i)
    {
      if (scales[i].Weight != null)
        scoredScales.push (scales[i]);
    }
    return scoredScales
  }
	
  static function GetCodesFromAnswers (answers)
  {
    var codes = [];
    for (var i = 0; i < answers.length; ++i)
      codes.push(answers[i].Precode);
    return codes;
  } 
}