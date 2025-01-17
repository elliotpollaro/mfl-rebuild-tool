from dataclasses import dataclass

from pymfl.exception import MissingYearAPIConfigException


@dataclass(kw_only=True, frozen=True)
class YearAPIConfig:
    """
    Used to hold the API config for a single year/league combination.
    """
    league_id: str
    mfl_user_id: str
    user_agent_name: str
    year: int
    franchise_id: str  # The user's franchise ID in this league


class APIConfig:
    """
    This class is used to store and set up initial API configuration.
    It should be set before any API calls are made.
    This is a BORG: https://code.activestate.com/recipes/66531/
    """
    config_by_year_and_league_id: dict[str, YearAPIConfig] = dict()

    @classmethod
    def get_config_by_year_and_league_id(cls, *, year: int, league_id: str) -> YearAPIConfig:
        try:
            return cls.config_by_year_and_league_id[f"{year}{league_id}"]
        except KeyError as e:
            raise MissingYearAPIConfigException(
                f"Cannot find YearAPIConfig for year '{year}' and league_id '{league_id}'.")

    @classmethod
    def add_config_for_year_and_league_id(cls, *, year: int, league_id: str, username: str, password: str,
                                          user_agent_name: str, franchise_id: str = None):
        from pymfl.api.SessionAPIClient import SessionAPIClient
        mfl_user_id = SessionAPIClient.get_mfl_user_id(year=year, username=username, password=password)
        
        # If no franchise_id provided, use a default
        if franchise_id is None:
            franchise_id = '0000'  # Default franchise ID
            
        cls.config_by_year_and_league_id[f"{year}{league_id}"] = YearAPIConfig(
            year=year,
            league_id=league_id,
            mfl_user_id=mfl_user_id,
            user_agent_name=user_agent_name,
            franchise_id=franchise_id
        )
