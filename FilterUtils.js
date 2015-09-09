class FilterUtils
{ 
  static const GlobalDateFilterStart = "GLOBALDATEFILTERSTART";
  static const GlobalDateFilterEnd = "GLOBALDATEFILTEREND";
  
  static function HideFilter (report, idx)
  {
    var filterQuestions = ReportMetaData.GetFilterQuestions(report, DS.Main);
    //var filterQuestions = MetaData.GetQuestionsByCategory2(report, DS.Main, "filter", true);
    return (idx > filterQuestions.length);
  }
  
  static function FilterHeading (report, text, filterNumber, log)
  {
    var filterQuestions = ReportMetaData.GetFilterQuestions(report, DS.Main, log);
    if (filterNumber <= filterQuestions.length) 
    {
      var question = filterQuestions[filterNumber-1];
      return question.Title;
    }
    else
      return '';
  }   
  
  static function GetGlobalFilterExpression(report, state, log)
  {
    var filterSegments = [];
    var dateFilters = GetGlobalDateFilterExpression(state);
    if(dateFilters.length > 0)
      filterSegments = filterSegments.concat(dateFilters);
    var parameterFilter = GetParamFilterExpression(report, state, log)
    if(parameterFilter != null)
      filterSegments.push(parameterFilter);
    return filterSegments.join(' AND ');
  }
  
  static function GetGlobalDateFilterExpression(state, log)
  {
    var filterExpressionSegments = [];
    if(!state.Parameters.IsNull(GlobalDateFilterStart))
    {
      var startDate = state.Parameters.GetDate(GlobalDateFilterStart);
      filterExpressionSegments.push(Config.DateVariableId + " >= TODATE(\"" + CreateShortDate(startDate) + "\")");
    }
    if(!state.Parameters.IsNull(GlobalDateFilterEnd))
    {
      var endDate = state.Parameters.GetDate(GlobalDateFilterEnd);
      filterExpressionSegments.push(Config.DateVariableId + " <= TODATE(\"" + CreateShortDate(endDate) + "\")");
    }
    if(filterExpressionSegments.length > 0)
      return filterExpressionSegments;
    else
      return [];
  }
  
  static function CreateShortDate(date)
  {
    var shortDateSegments = [];
    shortDateSegments.push(date.Year);
    if(date.Month < 10)
      shortDateSegments.push("0" + date.Month);
    else
      shortDateSegments.push(date.Month);
    if(date.Day < 10)
      shortDateSegments.push("0" + date.Day);
    else
      shortDateSegments.push(date.Day);
    return shortDateSegments.join("-");    
  }
  
  static function GetParamFilterExpression (report, state, log)
  {
    var filterQuestions = ReportMetaData.GetFilterQuestions(report, DS.Main, log);
    //var filterQuestions = MetaData.GetQuestionsByCategory2(report, DS.Main, "filter", true, log);
    var filterExpressionSegments = [];
    for (var i = 0; i < filterQuestions.length; ++i) 
    {
      var codes = GetFilterCodes(i, state);
      if (codes.length > 0)
        filterExpressionSegments.push ('IN(' + filterQuestions[i].QuestionId + ',' + codes.join(',') + ')');
    }
    if(filterExpressionSegments.length > 0)
      return filterExpressionSegments.join(' AND ');
    else
      return null;
  }
  
  private static function GetFilterCodes(filterNumber, state)
  {
    var parameterName = 'FILTER' + (filterNumber + 1);
    var codes = ParamUtil.GetParamCodes (state, parameterName);
    for (var i = 0; i < codes.length; ++i)
      codes[i] = '"' + codes[i] + '"';
    return codes;
  }
  
  static function GetFilterText(report, state, log)
  {
    var filterTexts = [];
    filterTexts = filterTexts.concat(GetDateFilterText(state, log));
    var parameterFilterText = GetParamFilterText (report, state, log);
    if(parameterFilterText != null)
      filterTexts.push(parameterFilterText);
    if(filterTexts.length > 0)
      return '<div class="FilterBackground">' + filterTexts.join('<span class=SelectorHeading> AND </span>') + '</div>';
    else
      return "";
  }
                                  
  static function GetParamFilterText (report, state, log)
  {
    var o = [];
    var project = report.DataSource.GetProject(DS.Main);
    var filterQuestions = ReportMetaData.GetFilterQuestions(report, DS.Main, log);
    ///var filterQuestions = MetaData.GetQuestionsByCategory2(report, DS.Main, "filter", true, log);
    for (var i = 0; i < filterQuestions.length; ++i)
    {
      var parameterName = 'FILTER' + (i + 1);
      var codes = ParamUtil.GetParamCodes (state, parameterName);
           
      if (codes.length > 0) 
      {
        o.push(CreateFilterTextSegment(filterQuestions[i].QuestionId, codes, project, filterQuestions[i].Title));
      }
    }
    if (o.length > 0)
      return o.join('<span class=SelectorHeading> AND </span>');
    else
      return null;
  }
  
  static function GetDateFilterText(state, log)
  {
    var filterExpressionTexts = [];
    if(!state.Parameters.IsNull(GlobalDateFilterStart))
    {
      var startDate = state.Parameters.GetDate(GlobalDateFilterStart);
      filterExpressionTexts.push('<div class="well-filter-summary well-filter-summary-xs">' + Config.DateVariableId + " >= " + CreateShortDate(startDate) + '</div>');
    }
    if(!state.Parameters.IsNull(GlobalDateFilterEnd))
    {
      var endDate = state.Parameters.GetDate(GlobalDateFilterEnd);
      filterExpressionTexts.push('<div class="well-filter-summary well-filter-summary-xs">' + Config.DateVariableId + " <= " + CreateShortDate(endDate) + '</div>');
    }
    if(filterExpressionTexts.length > 0)
      return filterExpressionTexts;//'<div class="well-filter-summary well-filter-summary-xs">' + filterExpressionTexts.join(" AND ") + '</div>';
    else
      return [];
  }
  
  private static function CreateFilterTextSegment(questionId, codes, project, filterLabel)
  {
    var question = project.GetQuestion(questionId);
    var label = (filterLabel == null) ? question.Title : filterLabel;
    var labels = [];
    for (var j = 0; j < codes.length; ++j)
    {
      var code = codes[j];
      labels.push (question.GetAnswer(code).Text);
    }
    return '<div class="well-filter-summary well-filter-summary-xs">' + label.toUpperCase() + ' = ' + labels.join (' | ') + '</div>';
  }
  
	static function GetFilterExpression (state, datasource_id, param_name, date_variable_id, parameter_variable_ids) {
		
		var periods = Time.GetODPeriods(state, param_name);

		if (periods.length > 0)
			return Time.GetExpression(periods[0], date_variable_id);
		else {

			// Use Custom Dates
			var start_date : DateTime = state.Parameters.IsNull(parameter_variable_ids[0])
				? null
				: state.Parameters.GetDate(parameter_variable_ids[0]);

			var end_date : DateTime = state.Parameters.IsNull(parameter_variable_ids[1])
				? null
				: state.Parameters.GetDate(parameter_variable_ids[1]);

			// Define Segment Filter
			var o = [];
			if (start_date != null) {
				var x = start_date.ToShortDateString().split('/');
				var start_date_formatted  = [ x[2], (x[0].length==1 ? '0' : '') + x[0], (x[1].length==1 ? '0' : '') + x[1] ].join('-');
				o.push (date_variable_id + '>= TODATE("' + start_date_formatted + '")');
			}
			if (end_date != null) {
				var x = end_date.ToShortDateString().split('/');
				var end_date_formatted  = [ x[2], (x[0].length==1 ? '0' : '') + x[0], (x[1].length==1 ? '0' : '') + x[1] ].join('-');
				o.push (date_variable_id + '<= TODATE("' + end_date_formatted + '")');
			}
			return o.join(' AND ');
		}
	}
}