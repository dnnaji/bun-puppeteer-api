CREATE MIGRATION m1546xoc7zostyhp2k7rhb6w255kjwfbmnimgnfgzzqnsmizuy2ppq
    ONTO m1ge3ne2vrofd3wsnefd2oxjleejiptrm5ucugg3ko2sqsdb7jsu4a
{
  ALTER TYPE default::Movie {
      ALTER PROPERTY title {
          CREATE CONSTRAINT std::exclusive;
          SET REQUIRED USING ('Untitled');
      };
  };
};
