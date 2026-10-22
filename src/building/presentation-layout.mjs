// Presentation only. Never filter the authority manifest or re-index atlas identities.
export function isPresented(room) {
  const [column, floor] = room.slot;
  const topRow = 8 - floor;
  return !((column < 2 && topRow === 3) ||
    (column >= 8 && topRow === 8));
}
export function isMobileRoom(room) {
  return isPresented(room) && room.slot[0] >= 3 && room.slot[0] <= 5 &&
    room.slot[1] >= 2 && room.slot[1] <= 6;
}
