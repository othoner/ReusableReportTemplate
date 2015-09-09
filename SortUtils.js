class SortUtil 
{  
  	static function SortByScore(a, b) 
    {
		if (a.Score < b.Score) return 1;
		if (a.Score > b.Score) return -1;
		if (a.Score == b.Score) return 0;
	}
  
    static function SortByScoreAscending(a, b) 
    {
		if (a.Score < b.Score) return -1;
		if (a.Score > b.Score) return 1;
		if (a.Score == b.Score) return 0;
	}
  
    static function SortByWeightAscending(a, b) 
    {
		if (a.Weight < b.Weight) return -1;
		if (a.Weight > b.Weight) return 1;
		if (a.Weight == b.Weight) return 0;
	} 
}