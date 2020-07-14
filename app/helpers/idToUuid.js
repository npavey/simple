define(function() {
  function isUUID(id) {
    var regex = new RegExp(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    );
    return regex.test(id);
  }

  return function IdToUuid(id) {
    if (isUUID(id)) {
      return id;
    }
    return (
      id.slice(0, 8) +
      "-" +
      id.slice(8, 12) +
      "-" +
      id.slice(12, 16) +
      "-" +
      id.slice(16, 20) +
      "-" +
      id.slice(20, 32)
    );
  };
});
