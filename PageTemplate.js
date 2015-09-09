class PageTemplate
{ 	
  static function Process (page, report, state, pageId, log)
  {
    if (pageId) 
    {
      ParamUtil.Save(state, report, 'LASTPAGE_ID', pageId);
    }
       
    switch (page.SubmitSource) 
    {       
      case 'ClearFilters':
        ClearFilters(report, state, log)
        break;
    }   
  }
  
  static function ClearFilters(report, state, log)
  {
    var filterQuestions = ReportMetaData.GetFilterQuestions(report, DS.Main, log);
    for (var i = 0; i < filterQuestions.length; ++i)
    {
      var filterParameterName = 'FILTER' + (i+1);
      state.Parameters[filterParameterName] = null;
    }
    state.Parameters["GLOBALDATEFILTERSTART"] = null;
    state.Parameters["GLOBALDATEFILTEREND"] = null;
    state.Parameters["FILTERS_SELECTED_EXPRESSION"] = null;
    state.Parameters["FILTERS_SELECTED_SUMMARY"] = null;
  }
}