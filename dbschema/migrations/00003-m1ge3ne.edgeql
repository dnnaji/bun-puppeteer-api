CREATE MIGRATION m1ge3ne2vrofd3wsnefd2oxjleejiptrm5ucugg3ko2sqsdb7jsu4a
    ONTO m1iuodgkmjfx7ti2nwqimxnrekm6evxmx7vtyatvrnt4wb6rzgkgqa
{
  ALTER TYPE default::Movie {
      ALTER PROPERTY title {
          RESET OPTIONALITY;
      };
  };
};
