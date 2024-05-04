CREATE MIGRATION m1iuodgkmjfx7ti2nwqimxnrekm6evxmx7vtyatvrnt4wb6rzgkgqa
    ONTO m1uwekrn4ni4qs7ul7hfar4xemm5kkxlpswolcoyqj3xdhweomwjrq
{
  ALTER TYPE default::Movie {
      ALTER PROPERTY title {
          SET REQUIRED USING (<std::str>'Untitled');
      };
  };
};
