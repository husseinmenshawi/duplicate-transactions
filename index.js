import { transactions } from "./sample-input.js";
import moment from "moment";
import _ from "lodash";

const duplicateTransactions = findDuplicateTransactions(transactions);
console.log(duplicateTransactions);

function findDuplicateTransactions(transactions = []) {
  if (transactions && transactions.length == 0) {
    console.log("No transactions found");
    return [];
  }

  const sortedTransactions = _.sortBy(transactions, "time");
  const groupedTransactions = {};
  const result = [];

  sortedTransactions.forEach((st) => {
    const { sourceAccount, targetAccount, amount, category } = st;
    const key = `${sourceAccount}_${targetAccount}_${amount}_${category}`;
    if (!groupedTransactions.hasOwnProperty(key)) {
      groupedTransactions[key] = [];
      groupedTransactions[key].push(st);
    } else {
      groupedTransactions[key].push(st);
    }
  });

  const keys = Object.keys(groupedTransactions);
  keys.forEach((key) => {
    const duplicates = [];
    const groupedTransactionByKey = groupedTransactions[key];

    groupedTransactionByKey.forEach((transaction, index) => {
      // Skip last index as there are no consecutive transaction time to compare
      if (index != groupedTransactionByKey.length - 1) {
        const nextTransaction = groupedTransactionByKey[index + 1];
        const timeDifferenceInSeconds = calculateTimeDifference({
          dateOne: transaction.time,
          dateTwo: nextTransaction.time,
          unit: "seconds",
        });

        const isTimeDifferenceLessThanOneMinute = checkIfDatesWithinTimeRange({
          timeDifference: timeDifferenceInSeconds,
          timeRange: 60,
        });

        if (isTimeDifferenceLessThanOneMinute) {
          if (!duplicates.includes(transaction)) {
            duplicates.push(transaction);
          }
          if (!duplicates.includes(nextTransaction)) {
            duplicates.push(nextTransaction);
          }
        }
      }
    });

    if (duplicates.length != 0) {
      result.push(duplicates);
    }
  });

  return result;
}

function calculateTimeDifference({ dateOne, dateTwo, unit }) {
  return moment(dateOne).diff(moment(dateTwo), unit);
}

function checkIfDatesWithinTimeRange({ timeDifference, timeRange }) {
  const highestTimeRange = timeRange;
  const lowestTimeRange = timeRange * -1;
  return (
    (timeDifference >= 0 && timeDifference <= highestTimeRange) ||
    (timeDifference <= 0 && timeDifference >= lowestTimeRange)
  );
}
