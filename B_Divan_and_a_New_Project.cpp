
#include <bits/stdc++.h>
using namespace std;
int ceil_division(int a, int b) {
	return (a + b - 1) / b;
}
int main() {
    int t;
    cin >> t;
 
    while (t--) {
			long long a, b;
			cin >> a >> b;
			long long ra = a;
			long long rb = b;
			while(ra%2 ==0){
				ra/= 2;
			}
			while(rb % 2==0){
				rb/=2;
			}
			if(ra != rb){
				cout << -1 << endl;
			}
			else{
				a = a/ra;
				b = b/rb;
				a = log2(a);
				b = log2(b);
				long long ans = ceil(abs(a - b) / 3.0);
				cout << ans << endl;
			}
      
    }
 
    return 0;
}


