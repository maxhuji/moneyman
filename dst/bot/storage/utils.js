import { formatISO, parseISO, roundToNearestMinutes } from "date-fns";
/**
 * Generates a hash for a transaction that can be used to ~uniquely identify it.
 * The hash is backwards compatible with the caspion hash.
 */
export function transactionHash(tx, companyId, accountNumber) {
    const date = roundToNearestMinutes(parseISO(tx.date)).toISOString();
    const parts = [
        date,
        tx.chargedAmount,
        tx.description,
        tx.memo,
        companyId,
        accountNumber,
    ];
    return parts.map((p) => String(p ?? "")).join("_");
}
/**
 *
 * @param tx
 * @param companyId
 * @param accountNumber
 * @returns A unique id for a transaction
 */
export function transactionUniqueId(tx, companyId, accountNumber) {
    const date = formatISO(tx.date, {
        representation: "date",
    });
    const parts = [
        date,
        companyId,
        accountNumber,
        tx.chargedAmount,
        tx.identifier || `${tx.description}_${tx.memo}`,
    ];
    return parts.map((p) => String(p ?? "").trim()).join("_");
}
//# sourceMappingURL=utils.js.map